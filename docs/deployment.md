GreenSpeed is comprised of three parts

## A static front end

This is the first thing people see. It's expected to be served either by static hosting, or object storage.

## An API, written using HAPI-Pal

This is a the NodeJS API, serving requests sent by form submissions from the frontend.

It makes a note of the request, and stores it, so a worker can carry out a sitespeed run against the provided url.


## A worker - also using HAPI

This is the worker process that looks for new sitespeed jobs, and runs them when it finds them.

It then stores the results of the sitespeed run, and makes it available for users to see.