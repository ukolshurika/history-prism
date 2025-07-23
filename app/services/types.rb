# frozen_string_literal: true

module Types
  include Dry.Types(:strict, :coercible, :nominal, :params, :json)
end
