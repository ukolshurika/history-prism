# frozen_string_literal: true

module RedisMutexStub
  module_function

  def stubbed_redis_mutex
    instance_double(RedisMutex).tap { |rm| allow(RedisMutex).to receive(:new).and_return rm }
  end

  def redis_mutex_pass!
    rm = stubbed_redis_mutex
    allow(rm).to receive(:lock!).and_return true
    allow(rm).to receive(:with_lock).and_yield
  end

  def redis_mutex_fail!
    rm = stubbed_redis_mutex
    allow(rm).to receive(:lock!).and_raise(RedisMutex::LockError)
    allow(rm).to receive(:with_lock).and_raise(RedisMutex::LockError)
  end
end
