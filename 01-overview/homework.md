# Introduction to AI-Assisted Development 

In this homework, we'll build an application with AI.

You can use any tool you want: ChatGPT, Claude, GitHub Copilot, Codex, Cursor, Antigravity, etc.

With chat-based applications you will need to copy code back-and-forth, so we recommend that you use an AI assistant in your IDE with agent mode.

We will build a TODO application in Django.

The app should be able to do the following:

- Create, edit and delete TODOs 
- Assign due dates
- Mark TODOs as resolved

You will only need Python to get started (we also recommend that you use `uv`).

You don't need to know Python or Django for doing this homework.


## Question 1: Install Django

We want to install Django. Ask AI to help you with that.

What's the command you used for that?

There could be multiple ways to do it. Put the one that AI suggested in the homework form.


```console
mdkir 01-overview

uv init 01-overview -p 3.11

cd 01-overview

uv venv
```

Active venv

```console
source .venv/bin/activate
```

Install Django with following command:

```console
uv pip install django
```


## Question 2: Project and App

Now we need to create a project and an app for that.

Follow the instructions from AI to do it. At some point, you will need to include the app you created in the project.

What's the file you need to edit for that?

- `settings.py`
- `manage.py`
- `urls.py`
- `wsgi.py`


### 1. Create a Django Project
Run this command inside your virtual environment:
```console
django-admin startproject todo_project
```

This creates a folder structure like:
```console
todo_project/
    manage.py
    todo_project/
        settings.py
        urls.py
        asgi.py
        wsgi.py
```

### 2. Enter the project directory
```console
cd todo_project
```

### 3. Create a Django App
Inside the project folder (where manage.py is), run:
```console
python manage.py startapp todos
```

This creates:
```console
myapp/
    admin.py
    apps.py
    models.py
    views.py
    urls.py (you may create this manually)
    tests.py
```

### 4. Register the app in settings

Open todo_project/settings.py and add your app to INSTALLED_APPS:
```console
INSTALLED_APPS = [
    # Django apps...
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Your app
    'todos',
]
```

### 5. Run the development server
```console
python manage.py runserver
```

## Question 3: Django Models

Let's now proceed to creating models - the mapping from python objects to a relational database. 

For the TODO app, which models do we need? Implement them.

What's the next step you need to take?

- Run the application
- Add the models to the admin panel
- Run migrations
- Create a makefile


## Question 4. TODO Logic

Let's now ask AI to implement the logic for the TODO app. Where do we put it? 

- `views.py`
- `urls.py`
- `admin.py`
- `tests.py`

### 1. Create a forms.py for the TODO form
Create a file todos/forms.py:
```console
from django import forms
from .models import Todo

class TodoForm(forms.ModelForm):
    class Meta:
        model = Todo
        fields = ['title', 'description', 'due_date', 'is_completed']
        widgets = {
            'due_date': forms.DateInput(attrs={'type': 'date'}),
        }
```
### 2. Implement CRUD views in todos/views.py

```console
from django.shortcuts import render, redirect, get_object_or_404
from .models import Todo
from .forms import TodoForm

# List all TODOs
def todo_list(request):
    todos = Todo.objects.all().order_by('due_date', 'is_completed')
    return render(request, 'todos/home.html', {'todos': todos})

# Create a new TODO
def todo_create(request):
    if request.method == 'POST':
        form = TodoForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('todo_list')
    else:
        form = TodoForm()
    return render(request, 'todos/todo_form.html', {'form': form})

# Edit an existing TODO
def todo_edit(request, pk):
    todo = get_object_or_404(Todo, pk=pk)
    if request.method == 'POST':
        form = TodoForm(request.POST, instance=todo)
        if form.is_valid():
            form.save()
            return redirect('todo_list')
    else:
        form = TodoForm(instance=todo)
    return render(request, 'todos/todo_form.html', {'form': form})

# Delete a TODO
def todo_delete(request, pk):
    todo = get_object_or_404(Todo, pk=pk)
    if request.method == 'POST':
        todo.delete()
        return redirect('todo_list')
    return render(request, 'todos/todo_confirm_delete.html', {'todo': todo})

# Mark a TODO as resolved
def todo_resolve(request, pk):
    todo = get_object_or_404(Todo, pk=pk)
    todo.is_completed = True
    todo.save()
    return redirect('todo_list')
```

### 3. Set up URLs in todos/urls.py

Create todos/urls.py:

```console
from django.urls import path
from . import views

urlpatterns = [
    path('', views.todo_list, name='todo_list'),
    path('create/', views.todo_create, name='todo_create'),
    path('edit/<int:pk>/', views.todo_edit, name='todo_edit'),
    path('delete/<int:pk>/', views.todo_delete, name='todo_delete'),
    path('resolve/<int:pk>/', views.todo_resolve, name='todo_resolve'),
]

```

Then include it in the project’s urls.py (todo_project/urls.py):
```console
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('todos.urls')),
]

```

### 4. Create templates for CRUD

Minimal templates needed:

```console
todos/templates/todos/
    base.html
    home.html
    todo_form.html
    todo_confirm_delete.html

```

home.html example snippet:
```console
{% extends 'todos/base.html' %}

{% block content %}
<h1>TODO List</h1>
<a href="{% url 'todo_create' %}">Create New TODO</a>
<ul>
  {% for todo in todos %}
    <li>
      {% if todo.is_completed %}
        <s>{{ todo.title }}</s>
      {% else %}
        {{ todo.title }}
      {% endif %}
      - {{ todo.due_date }}
      <a href="{% url 'todo_edit' todo.pk %}">Edit</a>
      <a href="{% url 'todo_delete' todo.pk %}">Delete</a>
      {% if not todo.is_completed %}
        <a href="{% url 'todo_resolve' todo.pk %}">Mark as done</a>
      {% endif %}
    </li>
  {% endfor %}
</ul>
{% endblock %}

```

## Question 5. Templates

Next step is creating the templates. You will need at least two: the base one and the home one. Let's call them `base.html` and `home.html`.

Where do you need to register the directory with the templates? 

- `INSTALLED_APPS` in project's `settings.py`
- `TEMPLATES['DIRS']` in project's `settings.py`
- `TEMPLATES['APP_DIRS']` in project's `settings.py`
- In the app's `urls.py`

### 1. Create a templates directory

A common structure is:
```console
todo_project/
    todos/
        templates/
            todos/
                base.html
                home.html
```

### 2. Register the templates directory in settings.py

Open todo_project/settings.py and find the TEMPLATES setting.
```console
import os
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],  # optional global folder
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                ...
            ],
        },
    },
]

```

### 3. base.html

Create todos/templates/todos/base.html:

```console
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>TODO App</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css">
</head>
<body>
<nav class="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
    <div class="container">
        <a class="navbar-brand" href="{% url 'todo_list' %}">TODO App</a>
    </div>
</nav>

<div class="container">
    {% block content %}
    {% endblock %}
</div>
</body>
</html>
```

### 4. home.html

Create todos/templates/todos/home.html:
```console
{% extends 'todos/base.html' %}

{% block content %}
<h1 class="mb-3">My TODO List</h1>

<a href="{% url 'todo_create' %}" class="btn btn-primary mb-3">Create New TODO</a>

<ul class="list-group">
  {% for todo in todos %}
    <li class="list-group-item d-flex justify-content-between align-items-center">
      <div>
        {% if todo.is_completed %}
          <s>{{ todo.title }}</s>
        {% else %}
          {{ todo.title }}
        {% endif %}
        {% if todo.due_date %}
          <small class="text-muted"> - Due: {{ todo.due_date }}</small>
        {% endif %}
      </div>
      <div>
        <a href="{% url 'todo_edit' todo.pk %}" class="btn btn-sm btn-warning">Edit</a>
        <a href="{% url 'todo_delete' todo.pk %}" class="btn btn-sm btn-danger">Delete</a>
        {% if not todo.is_completed %}
          <a href="{% url 'todo_resolve' todo.pk %}" class="btn btn-sm btn-success">Mark Done</a>
        {% endif %}
      </div>
    </li>
  {% empty %}
    <li class="list-group-item">No TODOs yet.</li>
  {% endfor %}
</ul>
{% endblock %}
```

### todo_form.html

Create todos/templates/todos/todo_form.html:
```console
{% extends 'todos/base.html' %}

{% block content %}
<h2>{% if form.instance.pk %}Edit TODO{% else %}Create TODO{% endif %}</h2>

<form method="post">
    {% csrf_token %}
    {{ form.as_p }}
    <button type="submit" class="btn btn-primary">
        {% if form.instance.pk %}Update{% else %}Create{% endif %}
    </button>
    <a href="{% url 'todo_list' %}" class="btn btn-secondary">Cancel</a>
</form>
{% endblock %}
```

### todo_confirm_delete.html

Create todos/templates/todos/todo_confirm_delete.html:
```console
{% extends 'todos/base.html' %}

{% block content %}
<h2>Delete TODO</h2>
<p>Are you sure you want to delete "{{ todo.title }}"?</p>

<form method="post">
    {% csrf_token %}
    <button type="submit" class="btn btn-danger">Yes, Delete</button>
    <a href="{% url 'todo_list' %}" class="btn btn-secondary">Cancel</a>
</form>
{% endblock %}
```

## Question 6. Tests

Now let's ask AI to cover our functionality with tests.

- Ask it which scenarios we should cover
- Make sure they make sense
- Let it implement it and run them 

Probably it will require a few iterations to make sure that tests pass and evertyhing is working. 

What's the command you use for running tests in the terminal? 

- `pytest`
- `python manage.py test`
- `python -m django run_tests`
- `django-admin test`

### Import TodoForm in tests.py

You need to import the TodoForm from the forms.py file into your tests.py file. Here's the corrected version of the top of your tests.py file:

todos/tests.py
```console
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

```

```console
python manage.py test
```
## Running the app

Now the application is developed and tested. Run it:

```bash
python manage.py runserver
```

Since we asked AI to test everything, it should just work. If it doesn't, iterate with AI until it works. 


## Homework URL

Commit your code to GitHub. You can create a repository for this course. Within the repository, create a folder, e.g. "01-todo", where you put the code.

Use the link to this folder in the homework submission form. 


## Tip

You can copy-paste the homework description into the AI system of your choice. But make sure you understand (and follow) all the steps in the response.


## Submission

Submit your homework here: https://courses.datatalks.club/ai-dev-tools-2025/homework/hw1


## Learning in Public

We encourage everyone to share what they learned. This is called "learning in public". 

Learning in public is one of the most effective ways to accelerate your growth. Here's why:

1. Accountability: Sharing your progress creates commitment and motivation to continue
2. Feedback: The community can provide valuable suggestions and corrections
3. Networking: You'll connect with like-minded people and potential collaborators
4. Documentation: Your posts become a learning journal you can reference later
5. Opportunities: Employers and clients often discover talent through public learning

Don't worry about being perfect. Everyone starts somewhere, and people love following genuine learning journeys!

### Example post for LinkedIn:

--- 
🚀 Week 1 of AI Dev Tools Zoomcamp by @DataTalksClub complete!

Just built a Django TODO application using AI assistants - without knowing Django beforehand!

Today I learned how to:

- ✅ Set up Django projects and apps
- ✅ Create database models and migrations
- ✅ Implement views and templates
- ✅ Write comprehensive tests with AI help

Here's my repo: <LINK>

Following along with this amazing course - who else is exploring AI development tools? 

You can sign up here: https://github.com/DataTalksClub/ai-dev-tools-zoomcamp/

---

### Example post for Twitter/X:

---

🤖 Built a Django app with AI in @Al_Grigor's AI Dev Tools Zoomcamp!

- ✨ TODO app from scratch
- 📝 Models & migrations
- 🎨 Views and templates
- ✅ Tests

My repo: <LINK>

Zero Django knowledge → working app in one session!

Join me: https://github.com/DataTalksClub/ai-dev-tools-zoomcamp/

---

