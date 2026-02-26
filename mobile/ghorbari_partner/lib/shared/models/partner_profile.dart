import 'package:equatable/equatable.dart';

class PartnerProfile extends Equatable {
  final String id;
  final String userId;
  final String businessName;
  final String? logoUrl;
  final String type; // 'seller' or 'service_provider'
  final bool isVerified;
  final double rating;
  final String? phone;
  final String? address;

  const PartnerProfile({
    required this.id,
    required this.userId,
    required this.businessName,
    this.logoUrl,
    required this.type,
    this.isVerified = false,
    this.rating = 0.0,
    this.phone,
    this.address,
  });

  factory PartnerProfile.fromJson(Map<String, dynamic> json) {
    return PartnerProfile(
      id: json['id'],
      userId: json['user_id'],
      businessName: json['business_name'] ?? 'Ghorbari Partner',
      logoUrl: json['logo_url'],
      type: json['type'] ?? 'seller',
      isVerified: json['is_verified'] ?? false,
      rating: (json['rating'] ?? 0.0).toDouble(),
      phone: json['phone'],
      address: json['address'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'business_name': businessName,
      'logo_url': logoUrl,
      'type': type,
      'is_verified': isVerified,
      'rating': rating,
      'phone': phone,
      'address': address,
    };
  }

  @override
  List<Object?> get props => [id, userId, businessName, logoUrl, type, isVerified, rating, phone, address];
}
