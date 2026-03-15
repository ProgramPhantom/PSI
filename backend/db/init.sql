create table if not exists users
(
    gsub      varchar not null
        constraint pkey
            primary key,
    email     varchar not null,
    firstname varchar not null,
    surname   varchar not null,
    picture   varchar
);

alter table users
    owner to postgres;

create table if not exists diagrams
(
    diagram_id    uuid      not null
        constraint diagrams_pk
            primary key,
    name          varchar   not null,
    date_created  timestamptz not null,
    date_modified timestamptz not null,
    owner         varchar   not null
        constraint diagrams_users_gsub_fk
            references users
);

alter table diagrams
    owner to postgres;

create table if not exists schemes
(
    scheme_id     uuid      not null
        constraint schemes_pk
            primary key,
    name          varchar   not null,
    date_created  timestamptz not null,
    date_modified timestamptz not null,
    owner         varchar   not null
        constraint schemes_users_gsub_fk
            references users
);

alter table schemes
    owner to postgres;

