---
published: 2022-03-17
modified: 2022-03-18
description: Using Nx Affected in Azure Pipelines
---

# Using Nx Affected in Azure Pipelines

When trying to combine the concepts of an [Affected Nx][1] projects and building
and deploying them in [Azure Pipelines][2], there is no plugin or anything
readily available to do so. Since it wasn't trivial to find and compose all the
bits and pieces together, I decided to write this down. Maybe it'll help you, or
maybe you can help me improve it.

## One Step Further

By default, many solutions use the diff between `HEAD` and `HEAD~1` to calculate
the affected projects. Such as Nrwl's own [Example of setting up distributed
Azure build for Nx workspace][3].

Although this may work well, I think this isn't always optimal. For instance,
the merge strategy and not knowing which is the last pipeline run having an
actually **successful** build may result in a suboptimal release pipeline (i.e.
too little or too many builds and deployments).

However, Azure has an API to [set and list pipeline run tags][4]. We can add a
tag for each Nx project build that was successful.

The main steps in this guide include:

1.  Find the latest successful build and the corresponding SHA-1.
2.  Use this SHA-1 as the `--base` for the `nx affected` command.
3.  Store the affected Nx project names in environment variables.
4.  Use these environment variables to conditionally execute the corresponding
    jobs or stages to build and deploy Nx projects.
5.  After a successful build, tag the current pipeline run (for step #1 in the
    next run).

## Find The Latest Successful Build

When the list of pipeline runs is filtered by the Nx project's tag and sorted by
time, we need only the latest result and we can further simplify the output by
returning only the SHA-1 (`sourceVersion`) in the most concise TSV format:

```bash
az pipelines runs list
  --branch main
  --pipeline-ids $(System.DefinitionId)
  --tags "my-app"
  --query-order FinishTimeDesc
  --query '[].[sourceVersion]'
  --top 1
  --out tsv
```

This will return the SHA-1 associated to the latest pipeline run tagged with
`my-app`. This is the run we are looking for, as we have tagged it only after a
successful build. Now, `nx affected` can determine whether this Nx project is
currently affected or not compared with the latest SHA-1 a successful build for
this Nx project was made from.

Later we will see how to set this tag for a successful build.

## Write It Down For Later

To set an environment variable for use in a later stage in Azure pipelines, we
need use the `task.setvariable` logging command (Azure docs: [Set variables in
scripts][5]). This writes the value `AFFECTED` to the environment variable
`BUILD_MY_APP`:

```bash
echo "##vso[task.setvariable variable=BUILD_MY_APP;isOutput=true]AFFECTED"
```

## Putting It Together

With the above ingredients, we can write a Bash script:

```bash
# Usage: is-affected [lib|app] [nx-project-name] [BUILD_NX_PROJECT_NAME]

is-affected() {
  local SHA=$(az pipelines runs list --branch main --pipeline-ids $(System.DefinitionId) --tags "$2" --query-order FinishTimeDesc --query '[].[sourceVersion]' --top 1 --out tsv)
  local WRITE_VARIABLE="##vso[task.setvariable variable=$3;isOutput=true]";
  if [[ "$SHA" =~ [0-9a-f]{5,40} ]]; then
    local AFFECTED=$(npx nx affected:${1}s --plain --base=$SHA --head=HEAD)
    if [[ "$AFFECTED" == *"$2"* ]]; then
      echo "${WRITE_VARIABLE}AFFECTED"
      echo "##[warning]$2 is affected (base: $SHA)"
    else
      echo "##[warning]$2 is NOT affected (base: $SHA)"
    fi
  elif [[ -z "$SHA" ]]; then
    echo "${WRITE_VARIABLE}TAG_NOT_FOUND"
    echo "##[warning]$2 was not previously tagged"
  else
    echo "##[error]$2 query gave an error: $SHA"
  fi
}

is-affected app my-app BUILD_MY_APP
is-affected app container5 BUILD_CONTAINER5
is-affected lib some-lib BUILD_SOME_LIB
```

This script also handles unfound tags and will log any errors from the
`az pipelines` command. This script isn't pretty, but it does the job. Perhaps
it should be ported to a Node.js script. Anyway, the result is output like this:

```txt
##[warning]my-app is NOT affected (base: 62ed6e5d1dd73564a088be879a47634456a07676)
##[warning]container5 is affected (base: 62ed6e5d1dd73564a088be879a47634456a07676)
##[warning]some-lib was not previously tagged
```

When system diagnostics are enabled, also the other `echo` commands that
actually set the variables are printed.

To see this script in perspective, here's an example "Prepare" stage:

```yaml
stages:
  - stage: Prepare
    pool:
      vmImage: ubuntu-latest
    jobs:
      - job: Determine_Affected
        displayName: Determine Affected Nx Projects
        steps:
          - task: NodeTool@0
            displayName: Use Node.js v16.14.1
            inputs:
              versionSpec: 16.14.1

          - script: npm install nx
            displayName: Install Nx

          # The Azure CLI tool may require you to set the `organization` and `project` first
          - bash: |
              az config set extension.use_dynamic_install=yes_without_prompt
              az devops configure --defaults organization=$(System.TeamFoundationCollectionUri) project="$(System.TeamProject)"
            displayName: Set default Azure DevOps organization and project

          - bash: |
              is-affected() {
                local SHA=$(az pipelines runs list ...)
                ...
              }
              is-affected app my-app BUILD_MY_APP
            name: AffectedNxProjects
            displayName: Determine affected Nx projects
            env:
              AZURE_DEVOPS_EXT_PAT: $(System.AccessToken)
```

## Conditional Builds

The `condition` for the job in another (build) stage is based on the variable
that was written with the Bash script in an earlier stage. The pattern to read
it:

```txt
stageDependencies.[[STAGE]].[[JOB]].outputs['[[STEP_NAME]].BUILD_MY-APP']
```

Also see Azure docs to [Set a variable for future stages][6].

When this variable has a value of `AFFECTED` or `TAG_NOT_FOUND` the condition
will evaluate to `true` and the job to build the Nx project will run. For
brevity, here is only the relevant part:

```yaml
jobs:
  - job: BUILD_MY_APP
    displayName: Build my-app
    condition: |
      in(stageDependencies.[[STAGE]].[[JOB]].outputs['[[STEP]].BUILD_MY-APP'], 'AFFECTED', 'TAG_NOT_FOUND')
    steps:
      - task: ...build container...
```

We can move the build job(s) to a template and reuse it with `nxProjectName` as
a parameter. Here's an example how to do that:

```yaml
- stage: Build
  dependsOn: Prepare
  jobs:
    - template: build-container.yaml
      parameters:
        nxProjectName: my-app
    - template: build-container.yaml
      parameters:
        nxProjectName: container5
    - template: build-container.yaml
      parameters:
        nxProjectName: some-lib
```

And then in the `build-container.yaml` template:

```yaml
parameters:
  - name: nxProjectName
    type: string

jobs:
  - job: BUILD_${{ upper(replace(parameters.nxProjectName, '-', '_')) }}
    displayName: Build ${{ parameters.nxProjectName }}
    condition: |
      in(stageDependencies.Prepare.Determine_Affected.outputs['AffectedNxProjects.BUILD_${{ upper(replace(parameters.nxProjectName, '-', '_')) }}'], 'AFFECTED', 'TAG_NOT_FOUND')
    steps:
      - task: ...build container...
```

Note that stages referred to in `stageDependencies` must be part of the
`dependsOn` option (`Prepare` in this example). Otherwise, the value will
silently resolve to `Null` without warning.

## Tag Successful Builds

This task should follow the build step(s) from the job above. We can tag
successful build runs with the name of the Nx project (`[nx-project-name]`):

    az pipelines runs tag add --run-id $(Build.BuildId) --tags [nx-project-name]

Now this command from the Bash script should find the latest tag for this Nx
project in the next pipeline run:

    az pipelines runs list --tags "[nx-project-name]" [...]

Again, you may need to set the `organization` and `project` first. Here's a
complete step:

```txt
- script: |
    az config set extension.use_dynamic_install=yes_without_prompt
    az devops configure --defaults organization=$(System.TeamFoundationCollectionUri) project="$(System.TeamProject)"
    az pipelines runs tag add --run-id $(Build.BuildId) --tags ${{ parameters.nxProjectName }}
    echo "##vso[task.setvariable variable=DEPLOY_${{ upper(replace(parameters.nxProjectName, '-', '_')) }};isOutput=true]true"
    echo "##[warning]Tagged build for ${{ parameters.nxProjectName }} (BUILD_${{ upper(replace(parameters.nxProjectName, '-', '_')) }})"
  condition: succeeded()
  displayName: Tag successful build
  name: TagBuild
  env:
    AZURE_DEVOPS_EXT_PAT: $(System.AccessToken)
```

This writes the `DEPLOY_MY_APP` variable. In a later (deployment) stage, the
same idea can be applied to read this variable and conditionally deploy the
build to any environment. An example chunk of the "production" stage:

```yaml
- stage: Production
  dependsOn: Build
  condition: succeeded('Build')
  jobs:
    - template: deploy-container.yaml
      parameters:
        nxProjectName: my-app
        environment: production
```

And then in `deploy-container.yaml`:

```yaml
parameters:
  - name: nxProjectName
    displayName: The Nx project key
    type: string
  - name: environment
    displayName: Environment
    type: string
    values:
      - test
      - staging
      - production

jobs:
  - deployment: |
      Deploy_${{ replace(parameters.nxProjectName, '-', '_') }}_${{ parameters.environment }}
    displayName:
      Deploy ${{ parameters.nxProjectName }} to ${{ parameters.environment }}
    environment: ${{ parameters.environment }}
    condition: |
      eq(stageDependencies.Build.BUILD_${{ upper(replace(parameters.nxProjectName, '-', '_'))}}.outputs['TagBuild.DEPLOY_${{ upper(replace(parameters.nxProjectName, '-', '_')) }}'], 'true')
    strategy:
      runOnce:
        deploy:
          steps:
            - ...deploy container?...
```

Again, stages referred to in `stageDependencies` must be part of the `dependsOn`
option (`Build` in this case).

I'll update this article as I find improvements. Hopefully this guide has been
of some help or inspiration.

[1]: https://nx.dev/using-nx/affected
[2]: https://azure.microsoft.com/en-us/services/devops/pipelines/
[3]: https://github.com/nrwl/nx-azure-build
[4]:
  https://docs.microsoft.com/en-us/cli/azure/pipelines/runs/tag?view=azure-cli-latest
[5]:
  https://docs.microsoft.com/en-us/azure/devops/pipelines/process/set-variables-scripts?view=azure-devops&tabs=bash
[6]:
  https://docs.microsoft.com/en-us/azure/devops/pipelines/process/set-variables-scripts?view=azure-devops&tabs=bash#set-a-variable-for-future-stages
