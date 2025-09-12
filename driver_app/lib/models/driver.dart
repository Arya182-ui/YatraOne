class Driver {
  final String id;
  final String name;
  final String email;
  final String phone;
  final bool approved;
  final String? assignedBusId;

  Driver({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    required this.approved,
    this.assignedBusId,
  });
}
