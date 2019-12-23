# Agamon
> Process of migrating state from one contract to another

## High-level procedure
1. Move authentication service to register users in a new db
1. Make changes in image-hash service
1. Stop sync jobs
1. Deploy new contract
1. Run migration script
1. Make change in cron jobs
1. Start the jobs again

## Migration script
1. [x] Take users from the old db and put them in Q1
1. [x] Take a user from Q1
    
    1. [x] Create a new record in the db with userId, accessToken and copyright
    1. [x] Get user's all images
    1. [x] Update last maxSyncedMaxId in the db
    1. [x] Put all images in the Q2

1. [x] Take image from Q2

    1. [x] Calculate image hash
    1. [x] Create a new record in the contract
    1. [x] Update number of registered images

## Changes to existing code base
### Authentication service
1. Change db url to store newly registered users

### Image hash
1. Change api of `/hash` to return binary hash of the image too

### Cron jobs
1. Work with new db
1. Change the format of state DTO
