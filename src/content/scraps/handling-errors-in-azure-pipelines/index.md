---
published: 2022-09-09
modified: 2025-03-19
tags:
  azure, pipelines, errors, failing, tasks, script, commands, failOnStderr,
  continueOnError
description:
  How to make Azure pipelines actually fail for various types of errors
image: ./leaking-azure-pipeline-in-surrealistic-style.webp
---

# Handling errors in Azure pipelines

Put mildly, Azure pipelines don't always behave as expected. Sometimes a
pipeline does not fail when it should. This scrap shows a few solutions to make
pipelines fail for script and task errors.

## Contents

We're going to look at three cases and ways to make pipelines fail:

- [Fail on errors written to `stderr` in scripts (`failOnStderr`)](#fail-on-errors-written-to-stderr-in-scripts)
- [Fail on errors written to `stderr` in tasks (`failOnStandardError`)](#fail-on-errors-written-to-stderr-in-tasks)
- [Fail on script errors (`set -e`)](#fail-on-script-errors)

And we'll also look at a way to [make a pipeline continue](#continue-on-error),
even if there are errors.

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

Why does this not make the task fail? It's because the `az` command does not
exit with a non-zero code.

This is often not the desired behavior. Fortunately, when we want to fail the
pipeline we do have some options:

- Use the `failOnStderr` task option
- Or use `set -e` inside the script

Let's look what happens when either of these are used.

## Fail on errors written to stderr in scripts

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

## Fail on errors written to stderr in tasks

When we want to do the same for a **task** (as opposed to a script), this
requires a different setting. For tasks the `failOnStandardError` option needs
to be set as part of the `inputs`:

```yaml
- task: AzureCLI@2
  displayName: Deploy my-container
  inputs:
    failOnStandardError: true
```

Alright, so we have:

- Script → `failOnStderr`
- Task → `failOnStandardError`

And we still have another option left: `set -e`

## Fail on script errors

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
