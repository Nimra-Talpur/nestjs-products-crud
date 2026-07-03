import { useState, useEffect } from 'react';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from './api/productsApi';
import './App.css';

function stockStatus(stock) {
  if (stock <= 0) return { label: 'Out of stock', className: 'stock-out' };
  if (stock <= 10) return { label: 'Low stock', className: 'stock-low' };
  return { label: 'In stock', className: 'stock-ok' };
}

function App() {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    stock: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await getProducts();
      setProducts(res.data);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({ name: '', price: '', description: '', stock: '' });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      name: formData.name,
      price: Number(formData.price),
      description: formData.description,
      stock: Number(formData.stock) || 0,
    };

    try {
      if (editingId) {
        await updateProduct(editingId, payload);
      } else {
        await createProduct(payload);
      }
      resetForm();
      fetchProducts();
    } catch (err) {
      console.error('Failed to save product:', err);
      alert('Something went wrong. Check console.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      price: product.price,
      description: product.description || '',
      stock: product.stock,
    });
    setEditingId(product._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product? This cannot be undone.')) return;
    try {
      await deleteProduct(id);
      fetchProducts();
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  };

  return (
    <div className="shell">
      <aside className="panel">
        <div className="panel-head">
          <span className="eyebrow">
            {editingId ? 'Edit entry' : 'New entry'}
          </span>
          <h1>Stockroom</h1>
          <p className="sub">Product catalog &amp; inventory ledger</p>
        </div>

        <form onSubmit={handleSubmit} className="ticket-form">
          <label>
            Name
            <input
              type="text"
              name="name"
              placeholder="Wireless Mouse"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </label>

          <div className="field-row">
            <label>
              Price (USD)
              <input
                type="number"
                name="price"
                placeholder="0.00"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                required
              />
            </label>
            <label>
              Stock
              <input
                type="number"
                name="stock"
                placeholder="0"
                value={formData.stock}
                onChange={handleChange}
              />
            </label>
          </div>

          <label>
            Description
            <textarea
              name="description"
              placeholder="Short note about this item..."
              value={formData.description}
              onChange={handleChange}
              rows={3}
            />
          </label>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving…' : editingId ? 'Update item' : 'Add to catalog'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="btn-ghost">
                Cancel
              </button>
            )}
          </div>
        </form>
      </aside>

      <main className="catalog">
        <div className="catalog-head">
          <h2>Catalog</h2>
          <span className="count-badge">{products.length} items</span>
        </div>

        {loading ? (
          <div className="empty-state">Loading catalog…</div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <p>No items yet.</p>
            <span>Add your first product using the form on the left.</span>
          </div>
        ) : (
          <div className="grid">
            {products.map((product) => {
              const status = stockStatus(product.stock);
              return (
                <article key={product._id} className="card">
                  <div className="card-top">
                    <h3>{product.name}</h3>
                    <span className={`dot ${status.className}`} title={status.label} />
                  </div>

                  <div className="price">
                    ${Number(product.price).toFixed(2)}
                  </div>

                  {product.description && (
                    <p className="desc">{product.description}</p>
                  )}

                  <div className="card-foot">
                    <span className={`status-text ${status.className}`}>
                      {status.label} · {product.stock} units
                    </span>
                    <div className="actions">
                      <button onClick={() => handleEdit(product)} className="icon-btn">
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="icon-btn danger"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;