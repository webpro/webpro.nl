---
published: 2022-09-09
modified: 2023-01-18
tags:
  azure, pipelines, failing, tasks, script, commands, failOnStderr,
  continueOnError
description:
  How to handle failing commands in script tasks in Azure pipelines, or continue
  on errors
image: ./leaking-azure-pipeline-in-surrealistic-style.webp
---

# Handling failing tasks in Azure pipelines

Sometimes failing scripts are not failing the task when they should. And
sometimes a failing command should not fail the task.

How to handle these situations?

## An unpleasant surprise

Let's dive straight into our topic and take a look at an example `script` task
that tries to tag a pipeline run:

```yaml
- script: |
    az pipelines runs tag add --run-id $(Build.BuildId) --tags my-container
    echo "Tagged build for my-container"
  displayName: Tag successful build
```

In this example the `az` command fails due to some missing extension. This
results in output like this:

```
Generating script.
========================== Starting Command Output ===========================
/bin/bash --noprofile --norc /agent/_work/_temp/3ecc72e6-92f7-4de6-96c3-35ae602c7620.sh
ERROR: The command requires the extension azure-devops. Unable to prompt for extension install confirmation as no tty available. Run 'az config set extension.use_dynamic_install=yes_without_prompt' to allow installing extensions without prompt.
Tagged build for my-container

Finishing: Tag successful build
```

The command fails and prints an `ERROR` (to `stderr`). But both the task and the
pipeline still succeed:

![pipeline success][1]

Why does this not fail the task? It's because the `az` command does not exit
with a non-zero code.

This is often not the desired behavior. Fortunately, when we want to fail the
pipeline we do have some options:

- Use the `failOnStderr` task option
- Use `set -e` inside the script

Let's look what happens when either of these are used.

## Fail on errors written to stderr

Here we can add `failOnStderr` as a task configuration option:

```yaml
- script: |
    az pipelines runs tag add --run-id $(Build.BuildId) --tags my-container
    echo "Tagged build for my-container"
  displayName: Tag successful build
  failOnStderr: true
```

This will execute the whole script, but make the task fail, since the `az`
command prints the error to `stderr`:

```
Generating script.
========================== Starting Command Output ===========================
/bin/bash --noprofile --norc /agent/_work/_temp/3ecc72e6-92f7-4de6-96c3-35ae602c7620.sh
ERROR: The command requires the extension azure-devops. Unable to prompt for extension install confirmation as no tty available. Run 'az config set extension.use_dynamic_install=yes_without_prompt' to allow installing extensions without prompt.
Tagged build for my-container
##[error]Bash wrote one or more lines to the standard error stream.
##[error]ERROR: The command requires the extension azure-devops. Unable to prompt for extension install confirmation as no tty available. Run 'az config set extension.use_dynamic_install=yes_without_prompt' to allow installing extensions without prompt.

Finishing: Tag successful build
```

The pipeline fails:

![pipeline failed][2]

### Another unpleasant surprise

As a side note, when we want to do the same for a **task** (as opposed to a
script), this requires a different setting. For tasks the `failOnStandardError`
option needs to be set as part of the `inputs`:

```yaml
- task: AzureCLI@2
  displayName: Deploy my-container
  inputs:
    failOnStandardError: true
```

This is not consistent. But let's continue with the `set -e` option we still
have left.

## Halt on script error

To make the script fail on errors, use `set -e` at the start of the script:

```yaml
- script: |
    set -e
    az pipelines runs tag add --run-id $(Build.BuildId) --tags my-container
    echo "Tagged build for my-container"
  displayName: Tag successful build
```

This will fail the script immediately:

```
Generating script.
========================== Starting Command Output ===========================
/bin/bash --noprofile --norc /agent/_work/_temp/a64b21a0-0a8e-4e6b-a0b4-271980ef4d05.sh
ERROR: The command requires the extension azure-devops. Unable to prompt for extension install confirmation as no tty available. Run 'az config set extension.use_dynamic_install=yes_without_prompt' to allow installing extensions without prompt.
##[error]Bash exited with code '2'.
Finishing: Tag successful build
```

And again, the pipeline fails as intended:

![pipeline failed][2]

But notice the difference in behavior: the "Tagged build for my-container"
message is not printed here.

Depending on the use case one or the other is the better choice, although I
think in general failing immediately is the better option.

## Continue on error

Last but not least, sometimes the pipeline should continue even if the task
failed. For this use case, there is `continueOnError` to the rescue:

```yaml
- script: |
    set -e
    az pipelines runs tag add --run-id $(Build.BuildId) --tags my-container
    echo "Tagged build for my-container"
  continueOnError: true
  displayName: Tag successful build
```

This will result in a green pipeline, but also a warning sign for the stage with
the failed task:

![pipeline warning][3]

Compare this to the initial situation where everything is naively green. At
least now we can see something is off.

## Azure DevOps documentation links

- [Command Line task][4] covers `failOnStderr`
- [Azure CLI task][5] covers `failOnStandardError`
- [Task types & usage][6] covers `continueOnError`

[1]: ./pipeline-success.webp
[2]: ./pipeline-failed.webp
[3]: ./pipeline-warning.webp
[4]:
  https://learn.microsoft.com/en-us/azure/devops/pipelines/tasks/utility/command-line
[5]:
  https://learn.microsoft.com/en-us/azure/devops/pipelines/tasks/deploy/azure-cli
[6]: https://learn.microsoft.com/en-us/azure/devops/pipelines/process/tasks
