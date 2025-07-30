FROM ruby:3.2.0

ENV BUNDLER_VERSION 2.3.26

# setup nodesource
RUN mkdir -p /etc/apt/keyrings && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
RUN echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list

RUN apt-get purge -y mariadb-common && \
    apt-get update && apt-get install -y lsb-release libgnutls30 ca-certificates && \
    wget https://dev.mysql.com/get/mysql-apt-config_0.8.29-1_all.deb && DEBIAN_FRONTEND="noninteractive" dpkg -i mysql-apt-config_0.8.29-1_all.deb && rm mysql-apt-config_0.8.29-1_all.deb && \
    curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
    echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list && apt-get update && \
    DEBIAN_FRONTEND="noninteractive" apt-get install -y \
    build-essential nodejs libsodium-dev yarn libyaml-dev \
    default-mysql-client default-libmysqlclient-dev && \
    apt-get autoremove -y

RUN gem install bundler -v ${BUNDLER_VERSION}

# Main working directory - the base directory used in any further
# RUN, COPY, and ENTRYPOINT commands.
RUN mkdir -p /app
WORKDIR /app
ENV PATH "$PATH:/app/bin"

EXPOSE 9292
EXPOSE 8080

CMD ["sh", "-c", "bundle exec"]