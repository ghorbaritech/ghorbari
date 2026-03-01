import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:ghorbari_partner/shared/models/product.dart';
import 'package:ghorbari_partner/features/inventory/data/datasources/product_remote_data_source.dart';

// Events
abstract class InventoryEvent extends Equatable {
  @override
  List<Object?> get props => [];
}

class InventoryFetchRequested extends InventoryEvent {
  final String partnerId;
  InventoryFetchRequested(this.partnerId);
  @override
  List<Object?> get props => [partnerId];
}

class InventoryAddRequested extends InventoryEvent {
  final Product product;
  InventoryAddRequested(this.product);
  @override
  List<Object?> get props => [product];
}

class InventoryDeleteRequested extends InventoryEvent {
  final String productId;
  final String partnerId;
  InventoryDeleteRequested(this.productId, this.partnerId);
  @override
  List<Object?> get props => [productId, partnerId];
}

// States
abstract class InventoryState extends Equatable {
  @override
  List<Object?> get props => [];
}

class InventoryInitial extends InventoryState {}
class InventoryLoading extends InventoryState {}
class InventoryLoaded extends InventoryState {
  final List<Product> products;
  InventoryLoaded(this.products);
  @override
  List<Object?> get props => [products];
}
class InventoryFailure extends InventoryState {
  final String message;
  InventoryFailure(this.message);
  @override
  List<Object?> get props => [message];
}

// Bloc
class InventoryBloc extends Bloc<InventoryEvent, InventoryState> {
  final ProductRemoteDataSource dataSource;

  InventoryBloc(this.dataSource) : super(InventoryInitial()) {
    on<InventoryFetchRequested>((event, emit) async {
      emit(InventoryLoading());
      try {
        final products = await dataSource.getPartnerProducts(event.partnerId);
        emit(InventoryLoaded(products));
      } catch (e) {
        emit(InventoryFailure(e.toString()));
      }
    });

    on<InventoryAddRequested>((event, emit) async {
      try {
        await dataSource.addProduct(event.product);
        add(InventoryFetchRequested(event.product.sellerId));
      } catch (e) {
        emit(InventoryFailure(e.toString()));
      }
    });

    on<InventoryDeleteRequested>((event, emit) async {
      try {
        await dataSource.deleteProduct(event.productId);
        add(InventoryFetchRequested(event.partnerId));
      } catch (e) {
        emit(InventoryFailure(e.toString()));
      }
    });
  }
}
