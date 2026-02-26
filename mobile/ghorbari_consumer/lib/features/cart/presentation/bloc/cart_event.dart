import 'package:equatable/equatable.dart';
import 'package:ghorbari_consumer/shared/models/product.dart';

abstract class CartEvent extends Equatable {
  const CartEvent();

  @override
  List<Object?> get props => [];
}

class CartItemAdded extends CartEvent {
  final Product product;
  final int quantity;

  const CartItemAdded(this.product, {this.quantity = 1});

  @override
  List<Object?> get props => [product, quantity];
}

class CartItemRemoved extends CartEvent {
  final String productId;

  const CartItemRemoved(this.productId);

  @override
  List<Object?> get props => [productId];
}

class CartItemQuantityChanged extends CartEvent {
  final String productId;
  final int delta;

  const CartItemQuantityChanged(this.productId, this.delta);

  @override
  List<Object?> get props => [productId, delta];
}

class CartCleared extends CartEvent {}
