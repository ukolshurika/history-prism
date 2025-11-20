# This file is copied to spec/ when you run 'rails generate rspec:install'
ENV['RAILS_ENV'] = 'test'
require File.expand_path('../config/environment', __dir__)
# Prevent database truncation if the environment is production
abort('The Rails environment is running in production mode!') if Rails.env.production?

# Checks for pending migration and applies them before tests are run.
# If you are not using ActiveRecord, you can remove this line.
ActiveRecord::Migration.maintain_test_schema!

require 'spec_helper'
require 'rspec/rails'
require 'capybara/rspec'
require 'active_model_serializers'
# Add additional requires below this line. Rails is not loaded until this point!

# Requires supporting ruby files with custom matchers and macros, etc, in
# spec/support/ and its subdirectories. Files matching `spec/**/*_spec.rb` are
# run as spec files by default. This means that files in spec/support that end
# in _spec.rb will both be required and run as specs, causing the specs to be
# run twice. It is recommended that you do not name files matching this glob to
# end with _spec.rb. You can configure this pattern with the --pattern
# option on the command line or in ~/.rspec, .rspec or `.rspec-local`.
#
# The following line is provided for convenience purposes. It has the downside
# of increasing the boot-up time by auto-requiring all files in the support
# directory. Alternatively, in the individual `*_spec.rb` files, manually
# require only the support files necessary.
#
Dir[Rails.root.join('spec/support/*/*.rb')].sort.each { |f| require f }
Dir[Rails.root.join('spec/support/*.rb')].sort.each { |f| require f }

RSpec.configure do |config|
  # Show full error details for 500 errors in request specs
  config.include RSpec::Rails::RequestExampleGroup, type: :request
  config.before(:each, type: :request) do
    Rails.application.config.action_dispatch.show_exceptions = :none
  end

  # Remove this line if you're not using ActiveRecord or ActiveRecord fixtures
  # config.fixture_path = "#{::Rails.root}/spec/fixtures"

  # If you're not using ActiveRecord, or you'd prefer not to run each of your
  # examples within a transaction, remove the following line or assign false
  # instead of true.
  config.use_transactional_fixtures = true

  # RSpec Rails can automatically mix in different behaviours to your tests
  # based on their file location, for example enabling you to call `get` and
  # `post` in specs under `spec/controllers`.
  #
  # You can disable this behaviour by removing the line below, and instead
  # explicitly tag your specs with their type, e.g.:
  #
  #     RSpec.describe UsersController, :type => :controller do
  #       # ...
  #     end
  #
  # The different available types are documented in the features, such as in
  # https://relishapp.com/rspec/rspec-rails/docs
  config.infer_spec_type_from_file_location!

  # Filter lines from Rails gems in backtraces.
  config.filter_rails_from_backtrace!

  # arbitrary gems may also be filtered via:
  # config.filter_gems_from_backtrace("gem name")

  Capybara.ignore_hidden_elements = false
  Capybara.javascript_driver = :selenium_chrome_headless
  Capybara.default_max_wait_time = 5

  Capybara.register_driver :selenium_chrome_headless do |app|
    options = Selenium::WebDriver::Chrome::Options.new
    options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--disable-gpu')

    Capybara::Selenium::Driver.new(app, browser: :chrome, options: options)
  end

  def capybara_redirects(b)
    opts = page.driver.instance_variable_get(:@options)
    opts[:follow_redirects] = b
  end

  # clear rails cache and email deliveries before every test
  config.before(:each) do
    ActionMailer::Base.deliveries = []
    Rails.cache.clear
  end

  # reset Timecop after every test
  config.after(:each) { Timecop.return }

  # Bullet setup
  if defined?(Bullet) && Bullet.enable?
    config.before(:each) { Bullet.start_request }

    config.after(:each) do
      Bullet.perform_out_of_channel_notifications if Bullet.notification?
      Bullet.end_request
    end
  end
end

RSpec::Matchers.define_negated_matcher :not_change, :change

Shoulda::Matchers.configure do |config|
  config.integrate do |with|
    with.test_framework :rspec
    with.library :rails
  end
end
