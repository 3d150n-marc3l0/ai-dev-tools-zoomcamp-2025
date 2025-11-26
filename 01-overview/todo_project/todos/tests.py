from django.test import TestCase

# Create your tests here.
from django.test import TestCase
from django.urls import reverse
from .models import Todo
from .forms import TodoForm
from datetime import date

class TodoAppTests(TestCase):

    def setUp(self):
        # This runs before each test case
        self.todo_data = {
            'title': 'Test TODO',
            'description': 'Test description',
            'due_date': date.today(),
            'is_completed': False
        }
        self.todo = Todo.objects.create(**self.todo_data)

    def test_create_todo(self):
        # Test creating a new TODO
        response = self.client.post(reverse('todo_create'), data=self.todo_data)
        self.assertEqual(response.status_code, 302)  # Should redirect after create
        self.assertEqual(Todo.objects.count(), 2)  # There should be 2 TODOs now
        new_todo = Todo.objects.last()
        self.assertEqual(new_todo.title, self.todo_data['title'])
        self.assertEqual(new_todo.description, self.todo_data['description'])
        self.assertEqual(new_todo.due_date, self.todo_data['due_date'])
        self.assertFalse(new_todo.is_completed)

    def test_edit_todo(self):
        # Test editing a TODO
        new_title = 'Updated TODO Title'
        response = self.client.post(reverse('todo_edit', args=[self.todo.pk]), data={
            'title': new_title,
            'description': self.todo.description,
            'due_date': self.todo.due_date,
            'is_completed': self.todo.is_completed
        })
        self.assertEqual(response.status_code, 302)  # Should redirect after update
        self.todo.refresh_from_db()
        self.assertEqual(self.todo.title, new_title)

    def test_delete_todo(self):
        # Test deleting a TODO
        response = self.client.post(reverse('todo_delete', args=[self.todo.pk]))
        self.assertEqual(response.status_code, 302)  # Should redirect after delete
        self.assertEqual(Todo.objects.count(), 0)  # No TODOs left

    def test_mark_todo_as_completed(self):
        # Test marking a TODO as completed
        response = self.client.get(reverse('todo_resolve', args=[self.todo.pk]))
        self.todo.refresh_from_db()
        self.assertTrue(self.todo.is_completed)

    def test_todo_list_view(self):
        # Test that the list view shows the correct TODOs
        response = self.client.get(reverse('todo_list'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, self.todo.title)
        #self.assertContains(response, self.todo.due_date)
        formatted_due_date = self.todo.due_date.strftime('%b. %d, %Y')  # Format like "Nov. 26, 2025"
        self.assertContains(response, f"Due: {formatted_due_date}")

    def test_todo_form_validation(self):
        # Test the form validation
        invalid_data = {
            'title': '',  # Missing title
            'description': 'Invalid description',
            'due_date': date.today(),
            'is_completed': False
        }
        form = TodoForm(data=invalid_data)
        self.assertFalse(form.is_valid())
        self.assertIn('title', form.errors)  # Title field should raise an error
