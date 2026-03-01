import 'package:equatable/equatable.dart';
import 'package:ghorbari_consumer/shared/models/category.dart';
import 'package:ghorbari_consumer/shared/models/product.dart';
import 'package:ghorbari_consumer/shared/models/cms_content.dart';

enum MarketplaceStatus { initial, loading, loaded, failure }

class MarketplaceState extends Equatable {
  final List<Category> categories;
  final List<Product> products;
  final CMSContent cmsContent;
  final MarketplaceStatus categoriesStatus;
  final MarketplaceStatus productsStatus;
  final MarketplaceStatus cmsStatus;
  final String? errorMessage;
  final Product? selectedProduct;
  final int nonce;

  const MarketplaceState({
    this.categories = const [],
    this.products = const [],
    this.cmsContent = const CMSContent({}),
    this.categoriesStatus = MarketplaceStatus.initial,
    this.productsStatus = MarketplaceStatus.initial,
    this.cmsStatus = MarketplaceStatus.initial,
    this.errorMessage,
    this.selectedProduct,
    this.nonce = 0,
  });

  MarketplaceState copyWith({
    List<Category>? categories,
    List<Product>? products,
    CMSContent? cmsContent,
    MarketplaceStatus? categoriesStatus,
    MarketplaceStatus? productsStatus,
    MarketplaceStatus? cmsStatus,
    String? errorMessage,
    Product? selectedProduct,
    int? nonce,
  }) {
    return MarketplaceState(
      categories: categories ?? this.categories,
      products: products ?? this.products,
      cmsContent: cmsContent ?? this.cmsContent,
      categoriesStatus: categoriesStatus ?? this.categoriesStatus,
      productsStatus: productsStatus ?? this.productsStatus,
      cmsStatus: cmsStatus ?? this.cmsStatus,
      errorMessage: errorMessage ?? this.errorMessage,
      selectedProduct: selectedProduct ?? this.selectedProduct,
      nonce: nonce ?? this.nonce,
    );
  }

  @override
  List<Object?> get props => [
        categories,
        products,
        cmsContent,
        categoriesStatus,
        productsStatus,
        cmsStatus,
        errorMessage,
        selectedProduct,
        nonce,
      ];
}
