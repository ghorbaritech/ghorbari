import 'package:equatable/equatable.dart';
import 'package:ghorbari_partner/shared/models/partner_profile.dart';

class PartnerEntity extends Equatable {
  final String id;
  final String email;
  final PartnerProfile? profile;

  const PartnerEntity({
    required this.id,
    required this.email,
    this.profile,
  });

  @override
  List<Object?> get props => [id, email, profile];
}
