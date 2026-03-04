import 'package:equatable/equatable.dart';

abstract class MarketplaceEvent extends Equatable {
  const MarketplaceEvent();

  @override
  List<Object?> get props => [];
}

class MarketplaceFetchCategories extends MarketplaceEvent {}

class MarketplaceFetchProducts extends MarketplaceEvent {
  final String? categoryId;
  final bool recursive;

  const MarketplaceFetchProducts({this.categoryId, this.recursive = false});

  @override
  List<Object?> get props => [categoryId, recursive];
}

class MarketplaceFetchProductDetails extends MarketplaceEvent {
  final String productId;

  const MarketplaceFetchProductDetails(this.productId);

  @override
  List<Object?> get props => [productId];
}

class MarketplaceFetchCMSContent extends MarketplaceEvent {}
