class Booking {
  final String id;
  final String userId;
  final String? partnerId;
  final String type; // design, service, product
  final String status; // pending, confirmed, processing, completed, cancelled
  final double totalAmount;
  final double advanceAmount;
  final Map<String, dynamic>? metadata;
  final DateTime createdAt;
  final DateTime? updatedAt;

  Booking({
    required this.id,
    required this.userId,
    this.partnerId,
    required this.type,
    required this.status,
    required this.totalAmount,
    required this.advanceAmount,
    this.metadata,
    required this.createdAt,
    this.updatedAt,
  });

  factory Booking.fromJson(Map<String, dynamic> json) {
    return Booking(
      id: json['id'],
      userId: json['user_id'],
      partnerId: json['partner_id'],
      type: json['type'],
      status: json['status'],
      totalAmount: (json['total_amount'] ?? 0).toDouble(),
      advanceAmount: (json['advance_amount'] ?? 0).toDouble(),
      metadata: json['metadata'],
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: json['updated_at'] != null ? DateTime.parse(json['updated_at']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'partner_id': partnerId,
      'type': type,
      'status': status,
      'total_amount': totalAmount,
      'advance_amount': advanceAmount,
      'metadata': metadata,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt?.toIso8601String(),
    };
  }
}
