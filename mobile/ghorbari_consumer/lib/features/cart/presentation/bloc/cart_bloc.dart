import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:ghorbari_consumer/features/cart/presentation/bloc/cart_event.dart';
import 'package:ghorbari_consumer/features/cart/presentation/bloc/cart_state.dart';
import 'package:ghorbari_consumer/shared/models/cart_item.dart';

class CartBloc extends Bloc<CartEvent, CartState> {
  CartBloc() : super(const CartState()) {
    on<CartItemAdded>(_onItemAdded);
    on<CartItemRemoved>(_onItemRemoved);
    on<CartItemQuantityChanged>(_onItemQuantityChanged);
    on<CartCleared>(_onCleared);
  }

  void _onItemAdded(CartItemAdded event, Emitter<CartState> emit) {
    final updatedItems = List<CartItem>.from(state.items);
    final existingIndex = updatedItems.indexWhere((item) => item.product.id == event.product.id);

    if (existingIndex >= 0) {
      updatedItems[existingIndex] = updatedItems[existingIndex].copyWith(
        quantity: updatedItems[existingIndex].quantity + event.quantity,
      );
    } else {
      updatedItems.add(CartItem(product: event.product, quantity: event.quantity));
    }

    emit(CartState(items: updatedItems, totalAmount: _calculateTotal(updatedItems)));
  }

  void _onItemRemoved(CartItemRemoved event, Emitter<CartState> emit) {
    final updatedItems = state.items.where((item) => item.product.id != event.productId).toList();
    emit(CartState(items: updatedItems, totalAmount: _calculateTotal(updatedItems)));
  }

  void _onItemQuantityChanged(CartItemQuantityChanged event, Emitter<CartState> emit) {
    final updatedItems = List<CartItem>.from(state.items);
    final index = updatedItems.indexWhere((item) => item.product.id == event.productId);

    if (index >= 0) {
      final newQuantity = updatedItems[index].quantity + event.delta;
      if (newQuantity <= 0) {
        updatedItems.removeAt(index);
      } else {
        updatedItems[index] = updatedItems[index].copyWith(quantity: newQuantity);
      }
    }

    emit(CartState(items: updatedItems, totalAmount: _calculateTotal(updatedItems)));
  }

  void _onCleared(CartCleared event, Emitter<CartState> emit) {
    emit(const CartState());
  }

  double _calculateTotal(List<CartItem> items) {
    return items.fold(0, (total, item) => total + (item.product.price * item.quantity));
  }
}
