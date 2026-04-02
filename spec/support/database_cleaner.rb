RSpec.configure do |config|
  # The suite already uses transactional fixtures and has no JS/system specs.
  # Keeping DatabaseCleaner enabled only duplicates transaction management and
  # currently triggers deadlocks during before(:suite) truncation.
end
