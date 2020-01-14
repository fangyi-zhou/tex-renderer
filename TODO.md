# TODOs

## Render a selected branch or commit
Currently the master branch is selected and rendered, but we should take care
of the use cases for checking out a branch, commit, or tag.

## Improve error reporting
Currently a generic 500 error is returned for any errors, but it is better to
report what kind of error has occurred:
  - Repo cannot be cloned
  - File does not exist
  - TeX cannot be rendered
  - ...

## Support private repos
This is an important use case.
We can probably use some OAuth with GitHub or other git providers to get read
access for private repos, and implement some auth functionality to access
private repos.

## Report progress
Show something when the repo is being cloned and tex is being rendered.
Currently it looks like the web request it taking forever to respond.
