import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:ghorbari_consumer/features/marketplace/domain/repositories/marketplace_repository.dart';
import 'package:ghorbari_consumer/features/marketplace/presentation/bloc/marketplace_event.dart';
import 'package:ghorbari_consumer/features/marketplace/presentation/bloc/marketplace_state.dart';

class MarketplaceBloc extends Bloc<MarketplaceEvent, MarketplaceState> {
  final MarketplaceRepository marketplaceRepository;

  MarketplaceBloc({required this.marketplaceRepository}) : super(MarketplaceInitial()) {
    on<MarketplaceFetchCategories>(_onFetchCategories);
    on<MarketplaceFetchProducts>(_onFetchProducts);
    on<MarketplaceFetchProductDetails>(_onFetchProductDetails);
  }

  Future<void> _onFetchCategories(
    MarketplaceFetchCategories event,
    Emitter<MarketplaceState> emit,
  ) async {
    emit(MarketplaceLoading());
    try {
      final categories = await marketplaceRepository.getCategories();
      emit(MarketplaceCategoriesLoaded(categories));
    } catch (e) {
      emit(MarketplaceFailure(e.toString()));
    }
  }

  Future<void> _onFetchProducts(
    MarketplaceFetchProducts event,
    Emitter<MarketplaceState> emit,
  ) async {
    emit(MarketplaceLoading());
    try {
      final products = await marketplaceRepository.getProducts(categoryId: event.categoryId);
      emit(MarketplaceProductsLoaded(products));
    } catch (e) {
      emit(MarketplaceFailure(e.toString()));
    }
  }

  Future<void> _onFetchProductDetails(
    MarketplaceFetchProductDetails event,
    Emitter<MarketplaceState> emit,
  ) async {
    emit(MarketplaceLoading());
    try {
      final product = await marketplaceRepository.getProductDetails(event.productId);
      emit(MarketplaceProductDetailsLoaded(product));
    } catch (e) {
      emit(MarketplaceFailure(e.toString()));
    }
  }
}
