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
    data          jsonb     not null,
    date_created  timestamp not null,
    date_modified timestamp not null,
    owner         varchar   not null
        constraint diagrams_users_gsub_fk
            references users
);

alter table diagrams
    owner to postgres;

