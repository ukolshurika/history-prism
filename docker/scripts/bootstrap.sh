#!/usr/bin/env bash

set -euf -o pipefail

#
# DATABASE BOOTSTRAPPING
#
MYSQL_CMD="mysql -h$MYSQL_HOST -u$MYSQL_USER -p$MYSQL_PASS "

db_exists() {
    dbcount=$($MYSQL_CMD -e "show databases;" | grep -c "$MYSQL_DB")
    if [[ $dbcount -gt 0 ]]; then true; else false; fi
}

#
# INSTALL RAILS DEPENDENCIES
#
if [[ ! -f "config/database.yml" ]]; then
    echo "config/database.yml is missing - copying default template"
    cp config/database.yml.sample config/database.yml
fi

bundle install --jobs 2

if ! db_exists; then
    echo "No database $MYSQL_DB - bootstrapping the database"
    # make dbseed
fi

#
# RUN DB MIGRATIONS
#
current_db=$($MYSQL_CMD $MYSQL_DB -B --skip-column-names -e 'select max(version) from schema_migrations;')
migrate_db=$(ls -1 db/migrate | cut -d_ -f1 | sort -n | tail -n1)

if [[ "$current_db" -lt "$migrate_db" ]]; then
    bundle exec rails db:migrate
fi
# bundle exec rails db:test:prepare

#
# OPEN A PORT TO INDICATE THAT WE'RE DONE HERE
apt-get install -y netcat
echo "done, opening $READY_PORT port flag"
while true; do nc -l -k -p $READY_PORT; done
