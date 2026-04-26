import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:Dalankotha_consumer/features/marketplace/domain/repositories/marketplace_repository.dart';
import 'package:Dalankotha_consumer/features/marketplace/presentation/bloc/marketplace_event.dart';
import 'package:Dalankotha_consumer/features/marketplace/presentation/bloc/marketplace_state.dart';
import 'package:Dalankotha_consumer/shared/models/cms_content.dart';
import 'package:Dalankotha_consumer/core/utils/logger.dart';

class MarketplaceBloc extends Bloc<MarketplaceEvent, MarketplaceState> {
  final MarketplaceRepository marketplaceRepository;

  MarketplaceBloc({required this.marketplaceRepository}) : super(const MarketplaceState()) {
    AppLogger.d('MarketplaceBloc created: $hashCode');
    on<MarketplaceFetchCategories>(_onFetchCategories);
    on<MarketplaceFetchProducts>(_onFetchProducts);
    on<MarketplaceFetchProductDetails>(_onFetchProductDetails);
    on<MarketplaceFetchCMSContent>(_onFetchCMSContent);
  }

  Future<void> _onFetchCMSContent(
    MarketplaceFetchCMSContent event,
    Emitter<MarketplaceState> emit,
  ) async {
    AppLogger.d('_onFetchCMSContent started');
    emit(state.copyWith(
      cmsStatus: MarketplaceStatus.loading,
      nonce: state.nonce + 1,
    ));
    try {
      AppLogger.d('Calling repository.getHomeCMSContent()...');
      final cmsContent = await marketplaceRepository.getHomeCMSContent();
      AppLogger.d('Repository returned content with keys: ${cmsContent.keys.join(", ")}');
      emit(state.copyWith(
        cmsStatus: MarketplaceStatus.loaded,
        cmsContent: CMSContent(cmsContent),
        nonce: state.nonce + 1,
      ));
    } catch (e) {
      AppLogger.d('CMS Content Fetch error: $e');
      emit(state.copyWith(
        cmsStatus: MarketplaceStatus.failure,
        errorMessage: e.toString(),
        nonce: state.nonce + 1,
      ));
    }
  }

  Future<void> _onFetchCategories(
    MarketplaceFetchCategories event,
    Emitter<MarketplaceState> emit,
  ) async {
    AppLogger.d('_onFetchCategories started');
    emit(state.copyWith(categoriesStatus: MarketplaceStatus.loading));
    try {
      final categories = await marketplaceRepository.getCategories();
      AppLogger.d('Fetched ${categories.length} categories: ${categories.map((c) => c.name).join(", ")}');
      emit(state.copyWith(
        categories: categories,
        categoriesStatus: MarketplaceStatus.loaded,
      ));
    } catch (e) {
      AppLogger.d('Categories Fetch error: $e');
      emit(state.copyWith(
        categoriesStatus: MarketplaceStatus.failure,
        errorMessage: e.toString(),
      ));
    }
  }

  Future<void> _onFetchProducts(
    MarketplaceFetchProducts event,
    Emitter<MarketplaceState> emit,
  ) async {
    AppLogger.d('_onFetchProducts started (categoryId: ${event.categoryId})');
    emit(state.copyWith(productsStatus: MarketplaceStatus.loading));
    try {
      final products = await marketplaceRepository.getProducts(
        categoryId: event.categoryId,
        recursive: event.recursive,
      );
      AppLogger.d('Fetched ${products.length} products');
      for (var p in products) {
        AppLogger.d('Product: "${p.name}" (ID: ${p.id}, CategoryID: ${p.categoryId})');
      }
      emit(state.copyWith(
        products: products,
        productsStatus: MarketplaceStatus.loaded,
      ));
    } catch (e) {
      AppLogger.d('Products Fetch error: $e');
      emit(state.copyWith(
        productsStatus: MarketplaceStatus.failure,
        errorMessage: e.toString(),
      ));
    }
  }

  Future<void> _onFetchProductDetails(
    MarketplaceFetchProductDetails event,
    Emitter<MarketplaceState> emit,
  ) async {
    emit(state.copyWith(productsStatus: MarketplaceStatus.loading));
    try {
      final product = await marketplaceRepository.getProductDetails(event.productId);
      emit(state.copyWith(
        selectedProduct: product,
        productsStatus: MarketplaceStatus.loaded,
      ));
    } catch (e) {
      emit(state.copyWith(
        productsStatus: MarketplaceStatus.failure,
        errorMessage: e.toString(),
      ));
    }
  }
}
