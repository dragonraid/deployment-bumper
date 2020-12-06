# Deployment bumper

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

This github action allows you to update deployment related stuff like OS images.
It does so by reading specified file in your repository updating respective
dependency/version and opening pull request with this update to against default branch.
See _Types_ section to see, what can this action update.

## Inputs

Environment variables are used for inputs instead of actual github action inputs,
because with environment variables local testing is more easier. In light of this,
supply your inputs like this:

```yaml
env:
  inputKey1: inputValue1
  inputKey2: inputValue2
  inputKey3: inputValue3
```

| Input      |                               Description |                        Example | Required |
| :--------- | ----------------------------------------: | -----------------------------: | -------: |
| TYPE       |                            processor type |                       `ubuntu` |      yes |
| FILE       | path to file to be updated (JSON or YAML) |              `deploy/ami.json` |      yes |
| KEY        |                 key in file to be updated |          `builders.source_ami` |      yes |
| REPOSITORY |                                repository | `dragonraid/deployment-bumper` |      yes |
| USERNAME   |                           github username |                   `dragonraid` |      yes |
| PASSWORD   |  password or github personal access token |                         `xxxx` |      yes |

## Types

This section describes what can you update with this action.

### Ubuntu image ID

**TYPE: `ubuntu`**

With this type you can update ubuntu image ID in various public clouds.
See [Ubuntu locator page](https://cloud-images.ubuntu.com/locator/) for more details.
In this type you specify parameters by which this action finds specified image.
By default this type returns latest image based on your inputs:

| Input         |                                           Description |      Example | Required |
| :------------ | ----------------------------------------------------: | -----------: | -------: |
| CLOUD         |                                     public cloud name | `Amazon AWS` |       no |
| ZONE          | Data-center/region, terminology varies based on cloud |  `us-east-1` |       no |
| VERSION       |                                        Ubuntu version |      `20.04` |       no |
| ARCHITECTURE  |                                     architecture name |      `amd64` |       no |
| INSTANCE_TYPE |         Virtualization details, varies based on cloud |    `hvm-ssd` |       no |
| RELEASE       |            release (do not supply if you want latest) |   `20200924` |       no |

#### Example

```yaml
name: update ubuntu base image

on:
  schedule:
    - cron:  '0 0 1 * *'

jobs:
  update:
    runs-on: ubuntu-20.04
    steps:
      - name: update ubuntu AMI
        uses: dragonraid/deployment-bumper
        env:
          TYPE: ubuntu
          FILE: ami.json
          REPOSITORY: dragonraid/test
          USERNAME: ${{ secrets.username }}
          PASSWORD: ${{ secrets.password }}
          KEYS: image.id
          CLOUD: Amazon AWS
          ZONE: us-east-1
          VERSION: '20.04'
          ARCHITECTURE: amd64
          INSTANCE_TYPE: hvm-ssd
```

### Helmfile lock

With this type you can update [helmfile](https://github.com/roboll/helmfile) lock files.
Under the hood this type runs [helmfile deps](https://github.com/roboll/helmfile#deps) command.

| Input       |                             Description | Example | Required |
| :---------- | --------------------------------------: | ------: | -------: |
| ENVIRONMENT | helmfile global options `--environment` | `myEnv` |       no |

#### Example

```yaml
name: update helmfile lock

on:
  schedule:
    - cron:  '0 0 1 * *'

jobs:
  update:
    runs-on: ubuntu-20.04
    steps:
      - name: update helmfile.lock
        uses: dragonraid/deployment-bumper
        env:
          TYPE: helmfile
          FILE: helmfile.yaml
          ENVIRONMENT: staging
```
