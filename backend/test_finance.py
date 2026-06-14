import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.accounts.models import User, AdminRole
from apps.payments.models import WithdrawalRequest, WithdrawalStatus
from rest_framework.test import APIClient
from django.test import Client

def run_test():
    # Create superadmin
    su, _ = User.objects.get_or_create(email='su@example.com', defaults={'is_superuser': True})
    su.set_password('password')
    su.save()

    # Create finance user
    finance_user, _ = User.objects.get_or_create(email='finance@example.com', defaults={'admin_role': AdminRole.FINANCE})
    finance_user.set_password('password')
    finance_user.save()

    client = APIClient(SERVER_NAME='localhost')

    # Login finance user
    client.force_authenticate(user=finance_user)
    
    # Check if they can view withdrawals
    res = client.get('/api/v1/payments/admin/withdrawals/')
    if res.status_code != 200:
        print(f"FAILED: Finance user could not GET withdrawals, status {res.status_code}")
        return False

    # Finance user creates a withdrawal request
    data = {
        'amount': '150.00',
        'method': 'momo',
        'account_name': 'John Doe',
        'account_number': '0551234567',
        'bank_or_network': 'MTN'
    }
    res = client.post('/api/v1/payments/admin/withdrawals/', data, content_type='application/json')
    if res.status_code != 201:
        print(f"FAILED: Finance user could not POST withdrawal, status {res.status_code}, {res.content}")
        return False
    
    req_id = res.json()['data']['id']
    print(f"SUCCESS: Finance user created withdrawal {req_id}")

    # Finance user tries to approve it (should fail)
    res = client.post(f'/api/v1/payments/admin/withdrawals/{req_id}/approve/', {'status': 'approved', 'proof_notes': 'test'}, content_type='application/json')
    if res.status_code != 403:
        print(f"FAILED: Finance user should be forbidden to approve, but got {res.status_code}")
        return False
    print("SUCCESS: Finance user is forbidden from approving requests")

    # Superadmin logs in
    client.force_authenticate(user=su)

    # Superadmin approves the request
    res = client.post(f'/api/v1/payments/admin/withdrawals/{req_id}/approve/', {'status': 'approved', 'proof_notes': 'txn_12345'}, content_type='application/json')
    if res.status_code != 200:
        print(f"FAILED: Superadmin could not approve withdrawal, status {res.status_code}, {res.content}")
        return False
    
    # Check DB
    req = WithdrawalRequest.objects.get(id=req_id)
    if req.status != WithdrawalStatus.APPROVED or req.proof_notes != 'txn_12345' or req.approved_by_id != su.id:
        print("FAILED: DB state is incorrect after approval")
        return False

    print("SUCCESS: Superadmin successfully approved the request!")
    print("All backend finance role checks passed.")
    return True

if __name__ == '__main__':
    run_test()
