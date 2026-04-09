# frozen_string_literal: true

module Events
  class LocationFilter
    def initialize(scope:, latitude:, longitude:, radius_km:)
      @scope = scope
      @latitude = latitude
      @longitude = longitude
      @radius_km = radius_km
    end

    def call
      matching_ids = location_rows.select do |_, event_latitude, event_longitude|
        distance_km(event_latitude, event_longitude) <= radius_km
      end.map(&:first)

      matching_ids.empty? ? scope.none : scope.where(id: matching_ids)
    end

    private

    attr_reader :scope, :latitude, :longitude, :radius_km

    def location_rows
      scope.except(:includes)
        .joins(:location)
        .where.not(locations: { latitude: nil, longitude: nil })
        .pluck(:id, 'locations.latitude', 'locations.longitude')
    end

    def distance_km(event_latitude, event_longitude)
      earth_radius_km = 6371.0
      lat1 = event_latitude.to_f * Math::PI / 180.0
      lon1 = event_longitude.to_f * Math::PI / 180.0
      lat2 = latitude.to_f * Math::PI / 180.0
      lon2 = longitude.to_f * Math::PI / 180.0

      delta_lat = lat2 - lat1
      delta_lon = lon2 - lon1

      a = Math.sin(delta_lat / 2)**2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(delta_lon / 2)**2
      2 * earth_radius_km * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    end
  end
end
