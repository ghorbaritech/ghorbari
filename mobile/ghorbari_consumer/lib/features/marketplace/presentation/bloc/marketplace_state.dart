import 'package:equatable/equatable.dart';
import 'package:ghorbari_consumer/shared/models/category.dart';
import 'package:ghorbari_consumer/shared/models/product.dart';

abstract class MarketplaceState extends Equatable {
  const MarketplaceState();

  @override
  List<Object?> get props => [];
}

class MarketplaceInitial extends MarketplaceState {}

class MarketplaceLoading extends MarketplaceState {}

class MarketplaceCategoriesLoaded extends MarketplaceState {
  final List<Category> categories;

  const MarketplaceCategoriesLoaded(this.categories);

  @override
  List<Object?> get props => [categories];
}

class MarketplaceProductsLoaded extends MarketplaceState {
  final List<Product> products;

  const MarketplaceProductsLoaded(this.products);

  @override
  List<Object?> get props => [products];
}

class MarketplaceProductDetailsLoaded extends MarketplaceState {
  final Product product;

  const MarketplaceProductDetailsLoaded(this.product);

  @override
  List<Object?> get props => [product];
}

class MarketplaceFailure extends MarketplaceState {
  final String message;

  const MarketplaceFailure(this.message);

  @override
  List<Object?> get props => [message];
}
