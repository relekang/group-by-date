# group-by-date

Group files by date, will move all files in the current folder
to sub folders with one of the following patterns.

```
$ npm install -g @relekang/group-by-date

$ group-by-date
  Usage: group-by-date [options] [command]

  Commands:
    help     Display help
    version  Display version

  Options:
    -d, --days       Instead of <year>/<file> <year>/<month>/<days>/<file>
    -D, --dry-run    Print instead of doing
    -h, --help       Output usage information
    -m, --months     Instead of <year>/<file> <year>/<month>/<file>
    -o, --one-level  Put month/day in folder-name instead of subfolders when used with --months or --days
    -v, --version    Output the version number
```
