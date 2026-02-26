import 'package:equatable/equatable.dart';

abstract class ServiceEvent extends Equatable {
  const ServiceEvent();

  @override
  List<Object?> get props => [];
}

class ServiceFetchAll extends ServiceEvent {
  final String? categoryId;

  const ServiceFetchAll({this.categoryId});

  @override
  List<Object?> get props => [categoryId];
}

class ServiceFetchDesignPackages extends ServiceEvent {}

class ServiceFetchDetails extends ServiceEvent {
  final String serviceId;

  const ServiceFetchDetails(this.serviceId);

  @override
  List<Object?> get props => [serviceId];
}
