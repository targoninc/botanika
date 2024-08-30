create schema if not exists botanika;

create table if not exists context
(
    user_id    bigint                               not null
        primary key,
    object     longtext collate utf8mb4_bin         not null
        check (json_valid(`object`)),
    updated_at datetime default current_timestamp() not null on update current_timestamp(),
);

create table if not exists pending_messages
(
    id             int auto_increment
        primary key,
    user_id        bigint      not null,
    type           varchar(64) not null,
    text           text        not null,
    timeToResponse bigint      not null,
);