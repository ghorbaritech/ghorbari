import 'package:equatable/equatable.dart';

abstract class MarketplaceEvent extends Equatable {
  const MarketplaceEvent();

  @override
  List<Object?> get props => [];
}

class MarketplaceFetchCategories extends MarketplaceEvent {}

class MarketplaceFetchProducts extends MarketplaceEvent {
  final String? categoryId;

  const MarketplaceFetchProducts({this.categoryId});

  @override
  List<Object?> get props => [categoryId];
}

class MarketplaceFetchProductDetails extends MarketplaceEvent {
  final String productId;

  const MarketplaceFetchProductDetails(this.productId);

  @override
  List<Object?> get props => [productId];
}
