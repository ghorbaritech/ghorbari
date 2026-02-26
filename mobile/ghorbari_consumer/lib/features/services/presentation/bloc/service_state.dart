import 'package:equatable/equatable.dart';
import 'package:ghorbari_consumer/shared/models/service_item.dart';

abstract class ServiceState extends Equatable {
  const ServiceState();

  @override
  List<Object?> get props => [];
}

class ServiceInitial extends ServiceState {}

class ServiceLoading extends ServiceState {}

class ServicesLoaded extends ServiceState {
  final List<ServiceItem> services;

  const ServicesLoaded(this.services);

  @override
  List<Object?> get props => [services];
}

class DesignPackagesLoaded extends ServiceState {
  final List<ServiceItem> designs;

  const DesignPackagesLoaded(this.designs);

  @override
  List<Object?> get props => [designs];
}

class ServiceDetailsLoaded extends ServiceState {
  final ServiceItem service;

  const ServiceDetailsLoaded(this.service);

  @override
  List<Object?> get props => [service];
}

class ServiceFailure extends ServiceState {
  final String message;

  const ServiceFailure(this.message);

  @override
  List<Object?> get props => [message];
}
