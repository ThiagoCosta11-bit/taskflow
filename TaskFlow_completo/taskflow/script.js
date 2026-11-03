'use strict';

const STORAGE_KEY = 'taskflow.tasks.v1';
const STATUSES = ['pendente', 'andamento', 'concluida'];
const STATUS_LABELS = { pendente: 'A Fazer', andamento: 'Em Andamento', concluida: 'Concluída' };
const PRIORITY_LABELS = { baixa: 'Baixa', media: 'Média', alta: 'Alta' };

let tasks = loadTasks();
let pendingDeleteId = null;

const $ = (selector) => document.querySelector(selector);
const form = $('#task-form');
const toast = $('#toast');

function loadTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed.filter(task => task && task.id && task.titulo) : [];
  } catch (error) {
    console.error('Não foi possível carregar as tarefas:', error);
    return [];
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error('Não foi possível salvar as tarefas:', error);
    showToast('Não foi possível salvar no navegador.');
  }
}

function createId() {
  return (window.crypto && crypto.randomUUID)
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toast.classList.remove('show'), 2600);
}

function escapeHTML(value = '') {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));
}

function formatDate(dateString) {
  if (!dateString) return 'Sem prazo';
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('pt-BR');
}

function isOverdue(task) {
  if (!task.prazo || task.status === 'concluida') return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [year, month, day] = task.prazo.split('-').map(Number);
  return new Date(year, month - 1, day) < today;
}

function getFilteredTasks() {
  const search = $('#search-input').value.trim().toLocaleLowerCase('pt-BR');
  const priority = $('#priority-filter').value;
  const status = $('#status-filter').value;
  return tasks.filter(task => {
    const matchesTitle = task.titulo.toLocaleLowerCase('pt-BR').includes(search);
    return matchesTitle && (!priority || task.prioridade === priority) &&
      (!status || task.status === status);
  });
}

function renderStats() {
  $('#total-count').textContent = tasks.length;
  $('#pending-count').textContent = tasks.filter(t => t.status === 'pendente').length;
  $('#progress-count').textContent = tasks.filter(t => t.status === 'andamento').length;
  $('#done-count').textContent = tasks.filter(t => t.status === 'concluida').length;
}

function taskCard(task) {
  const description = task.descricao ? `<p>${escapeHTML(task.descricao)}</p>` : '';
  const category = task.projeto ? `<div class="category"># ${escapeHTML(task.projeto)}</div>` : '';
  const dueClass = isOverdue(task) ? 'due-date overdue' : 'due-date';
  const dueText = isOverdue(task) ? `Atrasada • ${formatDate(task.prazo)}` : formatDate(task.prazo);
  return `
    <article class="task-card" data-id="${escapeHTML(task.id)}">
      <h4>${escapeHTML(task.titulo)}</h4>
      ${description}
      <div class="task-meta">
        <span class="priority ${escapeHTML(task.prioridade)}">${PRIORITY_LABELS[task.prioridade] || 'Média'}</span>
        <span class="${dueClass}">${dueText}</span>
      </div>
      ${category}
      <div class="task-bottom">
        <span class="task-owner">${task.responsavel ? `◉ ${escapeHTML(task.responsavel)}` : 'Sem responsável'}</span>
        <div class="task-actions">
          <button class="icon-btn" type="button" data-action="edit" data-id="${escapeHTML(task.id)}" aria-label="Editar tarefa" title="Editar">✎</button>
          <button class="icon-btn" type="button" data-action="delete" data-id="${escapeHTML(task.id)}" aria-label="Excluir tarefa" title="Excluir">⌫</button>
        </div>
      </div>
      <div class="task-bottom">
        <span class="task-owner">Mover para</span>
        <select class="status-select" data-action="status" data-id="${escapeHTML(task.id)}" aria-label="Alterar status de ${escapeHTML(task.titulo)}">
          ${STATUSES.map(status => `<option value="${status}" ${task.status === status ? 'selected' : ''}>${STATUS_LABELS[status]}</option>`).join('')}
        </select>
      </div>
    </article>`;
}

function render() {
  const visibleTasks = getFilteredTasks();
  STATUSES.forEach(status => {
    const inColumn = visibleTasks.filter(task => task.status === status);
    $(`#list-${status}`).innerHTML = inColumn.length
      ? inColumn.map(taskCard).join('')
      : '<div class="empty-state"><span>☼</span>Nenhuma tarefa por aqui</div>';
    $(`#count-${status}`).textContent = inColumn.length;
  });
  renderStats();
}

function resetForm() {
  form.reset();
  $('#task-id').value = '';
  $('#status').value = 'pendente';
  $('#form-heading').textContent = 'Adicionar nova tarefa';
  $('#submit-btn').textContent = '＋ Adicionar tarefa';
  $('#cancel-edit').classList.add('hidden');
}

function handleSubmit(event) {
  event.preventDefault();
  if (!form.reportValidity()) return;

  const id = $('#task-id').value;
  const existing = tasks.find(task => task.id === id);
  const task = {
    id: id || createId(),
    titulo: $('#titulo').value.trim(),
    responsavel: $('#responsavel').value.trim(),
    prioridade: $('#prioridade').value,
    prazo: $('#prazo').value,
    projeto: $('#projeto').value.trim(),
    status: $('#status').value,
    descricao: $('#descricao').value.trim(),
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (!task.titulo) {
    $('#titulo').focus();
    return;
  }

  if (existing) {
    tasks = tasks.map(item => item.id === id ? task : item);
    showToast('Tarefa atualizada com sucesso!');
  } else {
    tasks.unshift(task);
    showToast('Tarefa adicionada com sucesso!');
  }

  saveTasks();
  resetForm();
  render();
}

function editTask(id) {
  const task = tasks.find(item => item.id === id);
  if (!task) return;
  $('#task-id').value = task.id;
  $('#titulo').value = task.titulo;
  $('#responsavel').value = task.responsavel || '';
  $('#prioridade').value = task.prioridade || 'media';
  $('#prazo').value = task.prazo || '';
  $('#projeto').value = task.projeto || '';
  $('#status').value = task.status || 'pendente';
  $('#descricao').value = task.descricao || '';
  $('#form-heading').textContent = 'Editar tarefa';
  $('#submit-btn').textContent = '✓ Salvar alterações';
  $('#cancel-edit').classList.remove('hidden');
  $('#new-task').scrollIntoView({ behavior: 'smooth', block: 'start' });
  $('#titulo').focus({ preventScroll: true });
}

function requestDelete(id) {
  pendingDeleteId = id;
  const dialog = $('#delete-dialog');
  if (typeof dialog.showModal === 'function') dialog.showModal();
  else if (window.confirm('Deseja excluir esta tarefa?')) deleteTask(id);
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  render();
  showToast('Tarefa excluída.');
}

function changeStatus(id, status) {
  if (!STATUSES.includes(status)) return;
  tasks = tasks.map(task => task.id === id
    ? { ...task, status, updatedAt: new Date().toISOString() }
    : task);
  saveTasks();
  render();
  showToast('Status atualizado.');
}

function clearFilters() {
  $('#search-input').value = '';
  $('#priority-filter').value = '';
  $('#status-filter').value = '';
  render();
}

form.addEventListener('submit', handleSubmit);
$('#cancel-edit').addEventListener('click', resetForm);
$('#top-add-btn').addEventListener('click', () => {
  $('#new-task').scrollIntoView({ behavior: 'smooth', block: 'start' });
  $('#titulo').focus({ preventScroll: true });
});
$('#search-input').addEventListener('input', render);
$('#priority-filter').addEventListener('change', render);
$('#status-filter').addEventListener('change', render);
$('#clear-filters').addEventListener('click', clearFilters);

document.addEventListener('click', event => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const { action, id } = button.dataset;
  if (action === 'edit') editTask(id);
  if (action === 'delete') requestDelete(id);
});

document.addEventListener('change', event => {
  const select = event.target.closest('select[data-action="status"]');
  if (select) changeStatus(select.dataset.id, select.value);
});

$('#confirm-delete').addEventListener('click', event => {
  if (!pendingDeleteId) return;
  deleteTask(pendingDeleteId);
  pendingDeleteId = null;
});

$('#delete-dialog').addEventListener('close', () => {
  pendingDeleteId = null;
});

const today = new Date();
$('#today-label').textContent = today.toLocaleDateString('pt-BR', {
  weekday: 'long', day: 'numeric', month: 'long'
}).toLocaleUpperCase('pt-BR');

render();
