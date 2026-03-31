# frozen_string_literal: true

module Paginatable
  extend ActiveSupport::Concern

  DEFAULT_PER_PAGE = 25

  private

  def paginate(scope, per_page: DEFAULT_PER_PAGE)
    scope.page(params[:page]).per(per_page)
  end

  def pagination_meta(collection)
    {
      total: collection.total_count,
      page: collection.current_page,
      per_page: collection.limit_value,
      total_pages: collection.total_pages
    }
  end
end
