# frozen_string_literal: true

module Events
  class IndexQuery
    def initialize(scope:, params:)
      @scope = scope
      @params = params
    end

    def call
      scope = apply_source_filters(base_scope)
      scope = apply_search(scope)
      scope = apply_category_filter(scope)
      scope = apply_location_filter(scope)
      apply_sort(scope)
    end

    private

    attr_reader :scope, :params

    def base_scope
      scope
    end

    def apply_search(current_scope)
      return current_scope unless params[:q].present?

      current_scope.search_full_text(params[:q])
    end

    def apply_category_filter(current_scope)
      return current_scope unless params[:category].present?

      current_scope.where(category: params[:category])
    end

    def apply_location_filter(current_scope)
      return current_scope unless params[:latitude].present? && params[:longitude].present? && params[:radius_km].present?

      Events::LocationFilter.new(
        scope: current_scope,
        latitude: params[:latitude],
        longitude: params[:longitude],
        radius_km: params[:radius_km]
      ).call
    end

    def apply_sort(current_scope)
      case params[:sort]
      when 'date'
        current_scope.sorted_by_date(params[:direction])
      when 'place'
        current_scope.sorted_by_place(params[:direction])
      else
        current_scope.order(created_at: :desc)
      end
    end

    def apply_source_filters(current_scope)
      current_scope = current_scope.where(source_type: params[:source_type]) if params[:source_type].present?
      current_scope = current_scope.where(source_id: params[:source_id]) if params[:source_id].present?
      current_scope
    end
  end
end
