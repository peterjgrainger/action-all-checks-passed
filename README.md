# GitHub action to verify all status checks complete successfully

After installation this action will iterate through all of your checks and pass if all your other checks pass.

## Installation

To configure the action add the following lines to your `.github/workflows/rebase.yml` workflow file:

```yml
on: check_run
  type: [completed]
name: success-check
jobs:
  checkForSuccess:
    name: success-check
    runs-on: ubuntu-latest
    steps:
    - name: Check
      uses: arup-group/action-all-checks-passed@master
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```
