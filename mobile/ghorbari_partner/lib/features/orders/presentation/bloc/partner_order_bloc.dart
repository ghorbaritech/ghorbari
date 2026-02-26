import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:ghorbari_partner/features/orders/domain/repositories/partner_order_repository.dart';
import 'package:ghorbari_partner/features/orders/presentation/bloc/partner_order_event.dart';
import 'package:ghorbari_partner/features/orders/presentation/bloc/partner_order_state.dart';

class PartnerOrderBloc extends Bloc<PartnerOrderEvent, PartnerOrderState> {
  final PartnerOrderRepository repository;

  PartnerOrderBloc({required this.repository}) : super(PartnerOrderInitial()) {
    on<PartnerOrderFetchRequested>(_onFetchRequested);
    on<PartnerOrderStatusUpdateRequested>(_onStatusUpdateRequested);
  }

  Future<void> _onFetchRequested(
    PartnerOrderFetchRequested event,
    Emitter<PartnerOrderState> emit,
  ) async {
    emit(PartnerOrderLoading());
    try {
      final orders = await repository.getPartnerOrders(event.partnerId);
      emit(PartnerOrdersLoaded(orders));
    } catch (e) {
      emit(PartnerOrderFailure(e.toString()));
    }
  }

  Future<void> _onStatusUpdateRequested(
    PartnerOrderStatusUpdateRequested event,
    Emitter<PartnerOrderState> emit,
  ) async {
    // Optimistic UI could be implemented here
    try {
      await repository.updateOrderStatus(event.orderId, event.status);
      // Re-fetch orders for simplicity in this demo
      // In a real app, we'd update the specific order in the state
    } catch (e) {
      emit(PartnerOrderFailure(e.toString()));
    }
  }
}
