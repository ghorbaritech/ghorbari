import 'package:equatable/equatable.dart';

abstract class PartnerOrderEvent extends Equatable {
  const PartnerOrderEvent();

  @override
  List<Object?> get props => [];
}

class PartnerOrderFetchRequested extends PartnerOrderEvent {
  final String partnerId;

  const PartnerOrderFetchRequested(this.partnerId);

  @override
  List<Object?> get props => [partnerId];
}

class PartnerOrderStatusUpdateRequested extends PartnerOrderEvent {
  final String orderId;
  final String status;

  const PartnerOrderStatusUpdateRequested(this.orderId, this.status);

  @override
  List<Object?> get props => [orderId, status];
}
