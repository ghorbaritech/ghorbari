import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:ghorbari_consumer/features/services/domain/repositories/service_repository.dart';
import 'package:ghorbari_consumer/features/services/presentation/bloc/service_event.dart';
import 'package:ghorbari_consumer/features/services/presentation/bloc/service_state.dart';

class ServiceBloc extends Bloc<ServiceEvent, ServiceState> {
  final ServiceRepository serviceRepository;

  ServiceBloc({required this.serviceRepository}) : super(ServiceInitial()) {
    on<ServiceFetchAll>(_onFetchAll);
    on<ServiceFetchDesignPackages>(_onFetchDesignPackages);
    on<ServiceFetchDetails>(_onFetchDetails);
  }

  Future<void> _onFetchAll(
    ServiceFetchAll event,
    Emitter<ServiceState> emit,
  ) async {
    emit(ServiceLoading());
    try {
      final services = await serviceRepository.getServices(categoryId: event.categoryId);
      emit(ServicesLoaded(services));
    } catch (e) {
      emit(ServiceFailure(e.toString()));
    }
  }

  Future<void> _onFetchDesignPackages(
    ServiceFetchDesignPackages event,
    Emitter<ServiceState> emit,
  ) async {
    emit(ServiceLoading());
    try {
      final designs = await serviceRepository.getDesignPackages();
      emit(DesignPackagesLoaded(designs));
    } catch (e) {
      emit(ServiceFailure(e.toString()));
    }
  }

  Future<void> _onFetchDetails(
    ServiceFetchDetails event,
    Emitter<ServiceState> emit,
  ) async {
    emit(ServiceLoading());
    try {
      final service = await serviceRepository.getServiceDetails(event.serviceId);
      emit(ServiceDetailsLoaded(service));
    } catch (e) {
      emit(ServiceFailure(e.toString()));
    }
  }
}
