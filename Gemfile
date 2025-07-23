# frozen_string_literal: true

source 'https://rubygems.org'
git_source(:github) { |repo| "https://github.com/#{repo}.git" }

ruby '~> 3.2.0'

gem 'dotenv-rails', require: 'dotenv/rails-now'
gem 'mysql2'
gem 'rails', '~> 8.0'

gem 'yabeda-prometheus'
gem 'yabeda-puma-plugin'
gem 'yabeda-rails'
gem 'yabeda-sidekiq'

gem 'after_commit_everywhere'
gem 'bcrypt', '~> 3.1.7'
gem 'dry-initializer'
gem 'dry-monads'
gem 'dry-struct'
gem 'dry-transaction'
gem 'dry-types'
gem 'dry-validation'
gem 'faraday', '~> 1.10'
gem 'faraday_middleware'
gem 'jbuilder', '~> 2.0'
gem 'lograge'
gem 'puma'
gem 'puma_worker_killer'
gem 'responders'
gem 'sentry-rails'
gem 'sentry-ruby'
gem 'sentry-sidekiq'
gem 'sidekiq', '< 7'
gem 'sidekiq-cron'
gem 'sidekiq-worker-killer'
gem 'statesman', '~> 10.0.0'

# Declare your gem's dependencies in cashier_engine.gemspec.
# Bundler will treat runtime dependencies like base dependencies, and
# development dependencies will be added by default to the :development group.
# gemspec

# Declare any dependencies that are still in development here instead of in
# your gemspec. These might include edge Rails or gems from your path or
# Git. Remember to move these dependencies to your gemspec before releasing
# your gem to rubygems.org.

# To use a debugger
# gem 'byebug', group: [:development, :test]

group :development do
  gem 'dry-types-rails'
end

group :development, :test do
  gem 'awesome_print'
  gem 'binding_of_caller'
  gem 'bootsnap', '>= 1.1.0', require: false
  gem 'factory_bot_rails', '~> 5.0.1'
  gem 'faker', '1.9.1'
  gem 'pry'
  gem 'pry-rails'
  gem 'pry-rescue'
  gem 'psych'
  gem 'rubocop'
  gem 'rubocop-performance'
  gem 'rubocop-rails'
  gem 'spring'

  # prettier-ruby's dependencies
  gem 'prettier_print'
  gem 'syntax_tree'
  gem 'syntax_tree-haml'
  gem 'syntax_tree-rbs'
end

group :test do
  gem 'capybara', '~> 3.4'
  gem 'codecov', require: false
  gem 'database_cleaner'
  gem 'fakeredis', require: 'fakeredis/rspec'
  gem 'rspec-rails'
  gem 'shoulda-matchers', '~> 5.0'
  gem 'simplecov', require: false
  gem 'timecop'
  gem 'webmock'
end
