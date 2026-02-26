import 'package:equatable/equatable.dart';
import 'package:ghorbari_partner/shared/models/order.dart';

abstract class PartnerOrderState extends Equatable {
  const PartnerOrderState();

  @override
  List<Object?> get props => [];
}

class PartnerOrderInitial extends PartnerOrderState {}

class PartnerOrderLoading extends PartnerOrderState {}

class PartnerOrdersLoaded extends PartnerOrderState {
  final List<Order> orders;

  const PartnerOrdersLoaded(this.orders);

  @override
  List<Object?> get props => [orders];
}

class PartnerOrderFailure extends PartnerOrderState {
  final String message;

  const PartnerOrderFailure(this.message);

  @override
  List<Object?> get props => [message];
}
