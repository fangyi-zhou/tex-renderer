# On-demand TeX renderer

## Motivation
It is generally not preferable to commit build artifacts in a git repository.
For most software this is fine, since you can clone the repo and build it
yourself (with some luck).
For TeX files, cloning and building a PDF file seems too much effort.
Therefore, this web service provides an online rendering solution to having to
do avoid manual clones for one-off reads.

## Build and Deployment
All source and config files are included in the repository.
The app is best deployed with Docker.
You can build the image by `docker build .` and then run the built image.
Currently, the service is deployed to Heroku on http://tex.fangyi.io/ or
http://tex-renderer.herokuapp.com/

## Usage
You can render a file in a public GitHub repository user/repo, with TeX root
file `main.tex` like this
http://tex.fangyi.io/render/user/repo/main.tex

It may take a while to render your TeX file, so please be patient.

## Features to do
See [TODO.md](TODO.md)

## Caveats
The front end is currently not functional.

The current service uses a free web dyno, so the web dyno sleeps after a period
of inactivity.
The start-up time is a bit long due to large Docker image.
