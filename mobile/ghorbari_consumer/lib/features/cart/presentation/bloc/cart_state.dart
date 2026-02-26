import 'package:equatable/equatable.dart';
import 'package:ghorbari_consumer/shared/models/cart_item.dart';

class CartState extends Equatable {
  final List<CartItem> items;
  final double totalAmount;

  const CartState({
    this.items = const [],
    this.totalAmount = 0,
  });

  @override
  List<Object?> get props => [items, totalAmount];
}
