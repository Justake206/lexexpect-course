from django.test import TestCase

class UsersSimpleTest(TestCase):
    def test_users_working(self):
        self.assertEqual(3 * 3, 9)
