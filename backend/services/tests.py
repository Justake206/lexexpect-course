from django.test import TestCase

class ServicesSimpleTest(TestCase):
    def test_services_working(self):
        self.assertEqual(2 + 2, 4)
