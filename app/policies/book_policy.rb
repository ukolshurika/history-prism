# frozen_string_literal: true

class BookPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      scope.where(creator: user)
    end
  end

  def index?
    user.present?
  end

  def show?
    user.present? && record.creator_id == user.id
  end

  def new?
    user.present?
  end

  def create?
    user.present?
  end

  def edit?
    user.present? && record.creator_id == user.id
  end

  def update?
    user.present? && record.creator_id == user.id
  end

  def destroy?
    user.present? && record.creator_id == user.id
  end
end
