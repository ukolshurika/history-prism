# frozen_string_literal: true

class LocationSerializer < ActiveModel::Serializer
  attributes :id, :place, :latitude, :longitude
end
