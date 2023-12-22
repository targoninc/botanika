create schema if not exists botanika;

create table if not exists botanika.context
(
    user_id    bigint                               not null
        primary key,
    object     longtext collate utf8mb4_bin         not null
        check (json_valid(`object`)),
    updated_at datetime default current_timestamp() not null on update current_timestamp(),
);
