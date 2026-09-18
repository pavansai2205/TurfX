from decimal import Decimal
from django.core.management.base import BaseCommand
from turfs.models import Slot, Turf
from users.models import User


class Command(BaseCommand):
    help = 'Seeds initial users, turf listings, and hourly slots for development.'

    def handle(self, *args, **options):
        self.stdout.write('Seeding initial data...')

        # 1. Player User
        player, created = User.objects.get_or_create(
            email='user@example.com',
            defaults={
                'name': 'Cricket Player',
                'phone': '9876543210',
                'role': User.Role.USER,
                'profile_image': 'https://api.dicebear.com/7.x/adventurer/svg?seed=Cricket%20Player'
            }
        )
        if created:
            player.set_password('password123')
            player.save()
            self.stdout.write(self.style.SUCCESS('Created player: user@example.com'))

        # 2. Turf Owner User
        owner, created = User.objects.get_or_create(
            email='owner@example.com',
            defaults={
                'name': 'Venue Turf Owner',
                'phone': '9876543211',
                'role': User.Role.TURF_OWNER,
                'profile_image': 'https://api.dicebear.com/7.x/adventurer/svg?seed=Venue%20Turf%20Owner'
            }
        )
        if created:
            owner.set_password('password123')
            owner.save()
            self.stdout.write(self.style.SUCCESS('Created owner: owner@example.com'))

        # 3. System Admin User
        admin, created = User.objects.get_or_create(
            email='admin@example.com',
            defaults={
                'name': 'System Admin',
                'phone': '9876543212',
                'role': User.Role.ADMIN,
                'is_staff': True,
                'is_superuser': True,
                'profile_image': 'https://api.dicebear.com/7.x/adventurer/svg?seed=System%20Admin'
            }
        )
        if created:
            admin.set_password('password123')
            admin.save()
            self.stdout.write(self.style.SUCCESS('Created admin: admin@example.com'))

        # 4. Sample Turf
        turf, created = Turf.objects.get_or_create(
            name='Royal Box Cricket Turf',
            defaults={
                'description': 'High performance floodlit artificial turf box cricket stadium with pitch sensors.',
                'location': 'Bangalore',
                'address': '100 Feet Road, Indiranagar, Bangalore',
                'price_per_hour': Decimal('1200.00'),
                'rating': Decimal('4.8'),
                'images': ['https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800'],
                'amenities': ['Floodlights', 'Dressing Room', 'Parking', 'Equipment Rental'],
                'owner': owner
            }
        )

        if created:
            self.stdout.write(self.style.SUCCESS('Created turf: Royal Box Cricket Turf'))
            # Generate 16 hourly slots
            slots_to_create = []
            for hour in range(6, 22):
                slots_to_create.append(
                    Slot(
                        turf=turf,
                        start_time=f'{hour:02d}:00',
                        end_time=f'{hour+1:02d}:00'
                    )
                )
            Slot.objects.bulk_create(slots_to_create)
            self.stdout.write(self.style.SUCCESS('Generated 16 hourly slots for Royal Box Cricket Turf'))

        self.stdout.write(self.style.SUCCESS('Seeding complete!'))
