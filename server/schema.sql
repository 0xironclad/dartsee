create table if not exists games
(
    id integer primary key,
    type text
);

create table if not exists players
(
    id text not null primary key,
    name text
);

create table if not exists game_players
(
    game_id integer not null,
    player_id text,
    id text not null primary key
);

create table if not exists throws
(
    id integer primary key,
    game_id integer,
    player_id text,
    score integer,
    modifier integer,
    x integer,
    y integer
);
